const myHeaders = new Headers();
myHeaders.append("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQGV4YW1wbGUuY29tIiwiZXhwIjoxNzIwMDM4MDQyLCJ1c2VySWQiOjF9.bcuzgEoY8foAbDPKgEa4rIWokHL0GMYcyt4dqCNbb0w");

const formdata = new FormData();

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  body: formdata,
  redirect: "follow"
};

export default fetch("http://localhost:9090/GetCommitDiff?repo=Um Belo livro para ficar rico&sha=d68a7b887ecfb855d056c06b8143d5af0f634099&path=1_Um_Belo_livro_para_ficar_rico/demo.docx", requestOptions)

