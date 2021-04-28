console.log("Hello world!!!");

const userNameElement: HTMLInputElement | null = document.querySelector(
  "#name"
);
const userAgeElement: HTMLInputElement | null = document.querySelector("#age");
const userPwdElement: HTMLInputElement | null = document.querySelector("#pwd");
const submitBtnElement = document.getElementById("submit") as HTMLElement;
const resultElement = document.getElementById("result") as HTMLElement;
const msgElement = document.getElementById("message") as HTMLElement;

submitBtnElement.addEventListener("click", () => {
  console.log("clicked");
  console.log(userPwdElement);

  if (userNameElement && userAgeElement && userPwdElement) {
    console.log(userNameElement.value);
    fetch(
      `/users?name=${userNameElement.value}&age=${userAgeElement.value}&password=${userPwdElement.value}`
    ).then((response) => {
      response.json().then((data) => {
        console.log(data);
        resultElement.textContent = `Id is ${data.id}`;
        msgElement.textContent = data.message;
      });
    });
  }
});
