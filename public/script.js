document
  .getElementById("deposit")
  .addEventListener("click", () => handleTransaction("deposit"));
document
  .getElementById("withdraw")
  .addEventListener("click", () => handleTransaction("withdraw"));

async function handleTransaction(type) {
  const userId = document.getElementById("userId").value;
  const amount = document.getElementById("amount").value;
  const responseElement = document.getElementById("response");

  if (!userId || !amount) {
    responseElement.innerText = "User ID and amount are required.";
    return;
  }

  try {
    const response = await fetch(`/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, amount }),
    });
    const result = await response.json();

    if (response.ok) {
      responseElement.innerText = JSON.stringify(result);
      responseElement.style.color = "green";
    } else {
      responseElement.innerText = `Error: ${result.error}`;
      responseElement.style.color = "red";
    }
  } catch (error) {
    responseElement.innerText = `Request failed: ${error.message}`;
    responseElement.style.color = "red";
  }
}
