import styled from "styled-components"
const NotFound = () => {
  return (
    <Container>
        <p className="error">Error : 404</p>
        <p className="not-found">Page Not Found</p>
    </Container>
  )
}

export default NotFound

const Container = styled.div`
display: flex;
justify-content: center;
align-items: center;
flex-direction: column;
height: 100vh;
.error{
    color: red;
}
.not-found{
    color: black;
    font-weight: bold;
    font-size: 30px;
    font-family: Verdana;
}

`