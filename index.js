const express = require("express");
const soap = require("soap");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

const wsdlUrl = "http://www.dneonline.com/calculator.asmx?WSDL";

app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML form
app.get("/", (req, res) => {
  res.send(`
    <h2>SOAP Calculator</h2>
    <form method="POST" action="/calculate">
      <input name="a" placeholder="Enter number A" required />
      <select name="operation">
        <option value="Add">Add</option>
        <option value="Subtract">Subtract</option>
        <option value="Multiply">Multiply</option>
        <option value="Divide">Divide</option>
      </select>
      <input name="b" placeholder="Enter number B" required />
      <button type="submit">Calculate</button>
    </form>
  `);
});

// Handle form submission
app.post("/calculate", (req, res) => {
  const { a, b, operation } = req.body;

  soap.createClient(wsdlUrl, (err, client) => {
    if (err) return res.send("SOAP Client Error: " + err);

    const args = {
      intA: Number(a),
      intB: Number(b),
    };

    client[operation](args, (err, result) => {
      if (err) return res.send("SOAP Method Error: " + err);

      const output = result[`${operation}Result`];
      res.send(
        `<h3>Result of ${operation}(${a}, ${b}) = ${output}</h3><a href="/">Back</a>`
      );
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
