import styled from "styled-components";
const NoInternetConnection = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container>
      <p className="message">No Internet Connection</p>
      <p>Please check your internet connection</p>
      <button className="refresh-button" onClick={handleRefresh}>
        Refresh
      </button>
    </Container>
  );
};

export default NoInternetConnection;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;

  .message {
    font-size: 24px;
    color: #ff0000;
    margin-bottom: 20px;
  }
  .refresh-button {
    margin-top: 10px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4caf50;
    color: #fff;
    border: none;
    border-radius: 5px;
    outline: none;
    cursor: pointer;
  }
`;
