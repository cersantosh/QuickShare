import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import getCurrentUser from "../utils/get_current_user.js";
import UsersMethods from "../controller/users.js";
import MessagesMethods from "../controller/messages.js";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { hostname } from "../constants/api_routes.js";

const Tooltip = ({
  messageId,
  socket,
  setIsMessageClicked,
  message,
  input,
  setEditMessageId,
  senderId,
  myData,
  setReplyMessageId,
  setEditReplyMessageId,
}) => {
  const deleteMessage = async () => {
    if (message.file) {
      await new MessagesMethods().deleteFile(message.fileName);
    }
    await new MessagesMethods().deleteMessage(messageId);
    const response = await new MessagesMethods().fetchMessageByData({
      $or: [
        { sender: myData._id, receiver: message.receiver._id },
        { sender: message.receiver._id, receiver: myData._id },
      ],
    });
    socket.current.emit("deleteMessage", {
      messages: response,
      receiverId: message.receiver._id,
    });
    setIsMessageClicked(false);
  };

  const editMessage = async () => {
    setIsMessageClicked(false);
    setEditMessageId(messageId);
    setEditReplyMessageId(messageId);
    input.current.value = message.message;
  };

  const replyMessage = async () => {
    setIsMessageClicked(false);
    setReplyMessageId(messageId);
    setEditReplyMessageId(messageId);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message.message);
    setIsMessageClicked(false);
  };

  const downloadFile = async () => {
    const fileURL = message.message;
    const fileName = message.fileName;
    console.log("Downloading url", fileURL);
    setIsMessageClicked(false);
    const isOkPressed = window.confirm(
      "Are you sure you want to download the file ?"
    );
    if (isOkPressed) {
      // Fetch the file content from the URL
      const response = await axios.get(fileURL, {
        responseType: "blob",
      });
      console.log("response while downloading file", response);
      if (response.status === 200) {
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        // Create a temporary link element for downloading
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.style.display = "none";

        // Append the link to the document body and trigger the download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        console.error("Failed to download the file");
      }
    }
  };

  return (
    <ToolTipContainer>
      <i class="fa-solid fa-play arrow-icon"></i>
      <div className="tooltip">
        <div className="tooltip-option" onClick={replyMessage}>
          <p>Reply</p>
          <i className="fa-solid fa-reply"></i>
        </div>

        {senderId === myData._id && (
          <>
            {!message.file && (
              <div className="tooltip-option" onClick={editMessage}>
                <p>Edit</p>
                <i className="fa-solid fa-pen-to-square"></i>
              </div>
            )}
            <div className="tooltip-option" onClick={deleteMessage}>
              <p>Delete</p>
              <i className="fa-solid fa-trash"></i>
            </div>
          </>
        )}

        <div className="tooltip-option" onClick={copyMessage}>
          <p>Copy</p>
          <i className="fa-solid fa-copy"></i>
        </div>

        {message.file && (
          <div className="tooltip-option" onClick={downloadFile}>
            <p>Download</p>
            <i className="fa-solid fa-download"></i>
          </div>
        )}
      </div>
    </ToolTipContainer>
  );
};

const ChatScreen = () => {
  const [myData, setMyData] = useState(null);
  const [receiverData, setReceiverData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [clickedMessageId, setClickedMessageId] = useState(null);
  const [isMessageClicked, setIsMessageClicked] = useState(false);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [editedMessage, setEditedMessage] = useState(null);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editReplyMessageId, setEditReplyMessageId] = useState(null);
  const [replyMessageId, setReplyMessageId] = useState(null);

  const input = useRef();
  const socket = useRef();
  const currentPersonId = useRef();

  const currentUser = getCurrentUser();
  const myUsername = currentUser.username;
  const id = currentUser._id;

  const fetchMyData = async () => {
    const userMethods = new UsersMethods();
    const response = await userMethods.readUserById(id);
    setMyData(response);
  };

  const fetchReceiverData = async () => {
    const response = await new UsersMethods().readUserById(selectedPersonId);
    setReceiverData(response);
  };

  const fetchMessages = async () => {
    const response = await new MessagesMethods().fetchMessageByData({
      $or: [
        { sender: id, receiver: currentPersonId.current },
        { sender: currentPersonId.current, receiver: id },
      ],
    });
    setMessages(response);
  };

  const sendMessage = async () => {
    let data = null;
    if (replyMessageId) {
      data = {
        sender: myData._id,
        receiver: selectedPersonId,
        replyTo: replyMessageId,
        message: input.current.value,
      };
    } else {
      data = {
        sender: myData._id,
        receiver: selectedPersonId,
        message: input.current.value,
      };
    }
    const messageMethods = new MessagesMethods();
    let response = await messageMethods.addMessage(data);
    response = await messageMethods.fetchMessageByData({
      _id: response._id,
    });
    input.current.value = "";
    socket.current.emit("sendMessage", response[0]);
    setReplyMessageId(null);
    setEditReplyMessageId(null);
  };

  const showMessageInteractionOption = (messageId) => {
    // disabling this option when user clicks on same message but enabling when user clicks on another message and showing this option on the message send by user
    setClickedMessageId(messageId);

    if (clickedMessageId === messageId) {
      setIsMessageClicked(!isMessageClicked);
    } else {
      setIsMessageClicked(true);
      setEditMessageId(null);
    }
  };

  const handleInput = async (event) => {
    if (event.key == "Enter") {
      editMessageId ? await editMessage() : await sendMessage();
    }
  };

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    const uniqueName = `${uuidv4()}${file.name}`;

    const messageMethods = new MessagesMethods();
    const downloadURL = await messageMethods.uploadFile(file, uniqueName);
    const data = {
      sender: myData._id,
      receiver: selectedPersonId,
      message: downloadURL,
      file: true,
      fileName: uniqueName,
    };
    let response = await messageMethods.addMessage(data);
    response = await messageMethods.fetchMessageByData({
      _id: response._id,
    });
    socket.current.emit("sendMessage", response[0]);
    event.target.value = "";
  };

  const editMessage = async () => {
    await new MessagesMethods().editMessage(clickedMessageId, {
      message: input.current.value,
    });
    socket.current.emit("editMessage", {
      messageId: clickedMessageId,
      message: input.current.value,
      receiverId: selectedPersonId,
    });
    input.current.value = "";
    setEditMessageId(null);
    setEditReplyMessageId(null);
  };

  useEffect(() => {
    console.log("i am fetch my data calling");
    fetchMyData();
  }, []);

  useEffect(() => {
    fetchReceiverData();
    console.log("changing selected person id", selectedPersonId);
    if (selectedPersonId != null) {
      fetchMessages();
    }
  }, [selectedPersonId]);

  useEffect(() => {
    console.log(hostname);
    socket.current = io(hostname);
    if (socket.current) {
      socket.current.on("connected", async () => {
        const data = await new UsersMethods().readUserById(id);
        socket.current.emit("userConnected", data);
      });

      socket.current.on("messageReceived", (data) => {
        console.log("selcted person id", selectedPersonId);
        if (id === data.sender._id) {
          setArrivalMessage(data);
        }
        if (currentPersonId.current === data.sender._id) {
          setArrivalMessage(data);
        }
      });
      socket.current.on("messageDeleted", (messages) => {
        setMessages(messages);
      });

      socket.current.on("oldMessageDeleted", async () => {
        await fetchMessages();
      });

      socket.current.on("messageEdited", (data) => {
        setEditedMessage(data);
      });

      socket.current.on("updateOnlineUsers", (onlineUsers) => {
        console.log("online users in client", onlineUsers);

        const isMyIdExist = onlineUsers.findIndex((user) => user._id === id);
        if (onlineUsers.length > 0 && isMyIdExist !== -1) {
          onlineUsers.splice(isMyIdExist, 1);
        }
        setAllUsers(onlineUsers);
      });

      socket.current.on("deleteOnlineUsers", (onlineUsers) => {
        const isMyIdExist = onlineUsers.findIndex((user) => user._id === id);
        if (onlineUsers.length > 0 && isMyIdExist !== -1) {
          onlineUsers.splice(isMyIdExist, 1);
        }
        setAllUsers(onlineUsers);
      });
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // User went offline (tab or app is not visible)
        socket.current.emit('userDisconnected', id);
      }
      else{
        const data = await new UsersMethods().readUserById(id);
        socket.current.emit("userConnected", data);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      socket.current.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);

    };
  }, []);

  useEffect(() => {
    editedMessage &&
      setMessages((messages) => {
        const tempMessages = [...messages];
        const messageToEdit = tempMessages.find(
          (message) => message._id === editedMessage.messageId
        );
        messageToEdit.message = editedMessage.message;
        return tempMessages;
      });
  }, [editedMessage]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  return (
    <Container>
      <div className="chat-people">
        {myData != null ? (
          <div className="avatar">
            <img src={myData.profilePhoto} alt="avatar" />
            <p>{myUsername}</p>
          </div>
        ) : (
          <img src={`assets/images/loading.gif`} alt="loader" />
        )}

        <div className="chat-people-list">
          {allUsers.length > 0 ? (
            allUsers.map((user, index) => {
              return (
                <div
                  key={index}
                  className={`avatar ${
                    user._id === selectedPersonId ? "selected-person" : ""
                  }`}
                  onClick={async () => {
                    setSelectedPersonId(user._id);
                    currentPersonId.current = user._id;
                  }}
                >
                  <img src={user.profilePhoto} alt="avatar" />
                  <p>{user.username}</p>
                </div>
              );
            })
          ) : (
            // <img src="assets/images/loading.gif" alt="loader" />
            <p>No online users</p>
          )}
        </div>
      </div>

      {selectedPersonId == null ? (
        <p>Welcome to QuickShare</p>
      ) : (
        <div className="chat-options">
          <div className="all-chats">
            {messages.map((message, index) => {
              let createdAt = new Date(message.createdAt);
              let date = createdAt.toDateString();
              let time = createdAt.toLocaleTimeString();
              let senderId = message.sender._id
                ? message.sender._id
                : message.sender;
              return (
                <div
                  className={`${senderId === myData._id ? "send" : "receive"}`}
                  key={index}
                >
                  <p>{time}</p>
                  <div className="avatar-message">
                    {senderId === myData._id && (
                      <img
                        src={myData.profilePhoto}
                        alt="avatar"
                        className="avatar-image"
                      />
                    )}
                    <p
                      className="message"
                      onClick={() => {
                        !message.replyTo &&
                          showMessageInteractionOption(message._id);
                      }}
                    >
                      {editReplyMessageId &&
                        editReplyMessageId === message._id && (
                          <i
                            class="fa-solid fa-xmark cross-icon"
                            onClick={(event) => {
                              setEditMessageId(null);
                              setReplyMessageId(null);
                              setEditReplyMessageId(null);
                              input.current.value = "";
                              event.stopPropagation();
                            }}
                          ></i>
                        )}

                      {message.replyTo === null
                        ? "Message has been deleted."
                        : message.replyTo
                        ? message.replyTo.message
                        : message.message}
                      <p className="date">
                        {message.replyTo
                          ? new Date(message.replyTo.createdAt).toDateString()
                          : date}
                      </p>
                    </p>
                    {senderId !== myData._id ? (
                      <img
                        src={receiverData.profilePhoto}
                        alt="avatar"
                        className="avatar-image"
                      />
                    ) : (
                      <p></p>
                    )}
                  </div>

                  {(message.replyTo || message.replyTo === null) && (
                    <div className="reply-container">
                      <div
                        className="reply-message"
                        onClick={() =>
                          showMessageInteractionOption(message._id)
                        }
                      >
                        <p>{message.message}</p>
                        <p>{date}</p>
                      </div>
                    </div>
                  )}

                  {isMessageClicked && clickedMessageId === message._id && (
                    <Tooltip
                      messageId={clickedMessageId}
                      socket={socket}
                      setIsMessageClicked={setIsMessageClicked}
                      message={messages.find(
                        (message) => message._id === clickedMessageId
                      )}
                      input={input}
                      setEditMessageId={setEditMessageId}
                      myData={myData}
                      senderId={senderId}
                      setReplyMessageId={setReplyMessageId}
                      setEditReplyMessageId={setEditReplyMessageId}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="input-message">
            <label className="file-label">
              <input type="file" className="file-input" onChange={uploadFile} />
              <i className="fa-solid fa-file"></i>
            </label>
            <input type="text" ref={input} onKeyDown={handleInput} />
            <i
              className="fa-solid fa-paper-plane send-button"
              onClick={editMessageId ? editMessage : sendMessage}
            ></i>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ChatScreen;

const ToolTipContainer = styled.div`
  margin-left: 10px;
  .arrow-icon {
    rotate: -90deg;
    display: flex;
    justify-content: center;
    margin-bottom: -3px;
    margin-top: -11px;
  }
  .tooltip {
    background-color: #333;
    color: #fff;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tooltip-option {
    padding: 10px;
    cursor: pointer;
  }

  .tooltip-option:hover {
    background-color: #555;
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;
  height: 100vh;
  .chat-people {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
    background-color: green;
    .avatar {
      display: flex;
      gap: 10px;
      cursor: pointer;
      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
    }
    .chat-people-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 0;
      max-height: 50%;
      width: 90%;
      overflow: auto;
      background-color: blue;

      .avatar {
        display: flex;
        gap: 10px;
        img {
          width: 30px;
          height: 30px;
        }
      }
      &::-webkit-scrollbar {
        width: 10px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #0074d9;
        border-radius: 5px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background-color: #0056b3;
      }

      &::-webkit-scrollbar-track {
        background-color: #f1f1f1;
      }

      &::-webkit-scrollbar-track:hover {
        background-color: #d3d3d3;
      }
      .selected-person {
        background-color: yellow;
      }
    }
  }

  .chat-options {
    background-color: red;
    position: relative;

    .input-message {
      width: 100%;
      height: 10vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      bottom: 0;
      gap: 10px;
      border: 3px solid blue;

      .send-button {
        cursor: pointer;
      }

      .file-label {
        padding: 10px;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        color: #0074d9;

        .file-input {
          display: none;
        }
        .fa-file {
          margin-right: 5px;
        }
      }

      input {
        width: 90%;
        padding: 10px;
        border-radius: 30px;
        font-size: 16px;
        outline: none;
        border: none;
      }

      input::placeholder {
        color: #aaa;
      }

      input:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(0, 116, 217, 0.5);
      }
    }

    .all-chats {
      overflow: auto;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 90vh;
      background-color: white;

      img.avatar-image {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .avatar-message {
        display: flex;
        gap: 10px;
      }

      .send {
        margin-bottom: 10px;
        display: flex;
        gap: 10px;
        flex-direction: column;
        align-self: flex-start;
        p.message {
          background-color: grey;
          border-radius: 10px;
          padding: 5px;
          position: relative;
          .cross-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 20px;
            height: 20px;
            background-color: #0097e6;
            color: white;
            padding: 3px;
            border-radius: 50%;
            position: absolute;
            top: -10px;
            right: -10px;
            &:hover {
              background-color: red;
            }
          }
        }
        .reply-container {
          margin-top: -10px;
          z-index: 1;
          .reply-message {
            margin-top: -5px;
            background-color: #0097e6;
            border-radius: 10px;
            padding: 5px;
          }
        }
      }
      .receive {
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-self: flex-end;
        p.message {
          background-color: yellow;
          border-radius: 10px;
          padding: 5px;
          position: relative;

          .cross-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 20px;
            height: 20px;
            background-color: #0097e6;
            color: white;
            padding: 3px;
            border-radius: 50%;
            position: absolute;
            top: -10px;
            right: -10px;
            &:hover {
              background-color: red;
            }
          }
        }

        .reply-container {
          margin-top: -10px;
          z-index: 1;
          .reply-message {
            margin-top: -5px;
            background-color: #0097e6;
            border-radius: 10px;
            padding: 5px;
          }
        }
      }
    }
  }
`;
