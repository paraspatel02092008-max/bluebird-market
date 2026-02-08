fetch("https://script.google.com/macros/s/AKfycbwlVuZxRzmEVtfy2-OmS3-ZtjwP4jHHg_vpYZ_0yBptho98MP-7FJJJ6acgn5ZxCV6jkQ/exec")
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById("orders");

    data.forEach(order => {
      const row = `
        <tr>
          <td>${order.date}</td>
          <td>${order.product}</td>
          <td>${order.price}</td>
          <td>${order.quantity}</td>
        </tr>
      `;
      table.innerHTML += row;
    });
  })
  .catch(() => alert("Failed to load orders"));
