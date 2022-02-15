const container = document.querySelector(".container");
var count = 0;
container.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("divider") &&
    !e.target.classList.contains("occupied") &&
    !e.target.classList.contains("selected")
  ) {
    e.target.classList.toggle("selected");
    count++;
    console.log(count);
    if (count > 1) {
      alert("Sadece 1 adet çalışma alanı reserve edebilirsiniz");
      !e.target.classList.toggle("selected");
      count--;
      console.log(count);
    }
  } else if (
    e.target.classList.contains("divider") &&
    !e.target.classList.contains("occupied")
  ) {
    e.target.classList.toggle("selected");
    count--;
    console.log("içindeyim");
  }
});

const container2 = document.querySelector(".floor2");

container2.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("divider") &&
    !e.target.classList.contains("occupied") &&
    !e.target.classList.contains("selected")
  ) {
    e.target.classList.toggle("selected");
    count++;
    console.log(count);
    if (count > 1) {
      alert("Sadece 1 adet çalışma alanı reserve edebilirsiniz");
      !e.target.classList.toggle("selected");
      count--;
      console.log(count);
    }
  } else if (
    e.target.classList.contains("divider") &&
    !e.target.classList.contains("occupied")
  ) {
    e.target.classList.toggle("selected");
    count--;
    console.log("içindeyim");
  }
});
const container3 = document.querySelector(".floor3");

container3.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("divider") &&
    !e.target.classList.contains("occupied") &&
    !e.target.classList.contains("selected")
  ) {
    e.target.classList.toggle("selected");
    count++;
    console.log(count);
    if (count > 1) {
      alert("Sadece 1 adet çalışma alanı reserve edebilirsiniz");
      !e.target.classList.toggle("selected");
      count--;
      console.log(count);
    }
  } else if (
    e.target.classList.contains("divider") &&
    !e.target.classList.contains("occupied")
  ) {
    e.target.classList.toggle("selected");
    count--;
    console.log("içindeyim");
  }
});
