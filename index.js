const express = require("express");
const soap = require("soap");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

const wsdlUrl = "http://www.dneonline.com/calculator.asmx?WSDL";

app.use(bodyParser.urlencoded({ extended: true }));

// Home - fetch methods and show UI
app.get("/", (req, res) => {
  soap.createClient(wsdlUrl, (err, client) => {
    if (err) return res.send("SOAP Client Error: " + err);

    const methods = Object.keys(client.describe().Calculator.CalculatorSoap);
    const methodOptions = methods
      .map((m) => `<option value="${m}">${m}</option>`)
      .join("");

    res.send(`
      <html>
      <head>
        <title>SOAP Calculator</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f0f4f8;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          }
          h2 {
            margin-bottom: 1rem;
            color: #333;
          }
          input, select, button {
            padding: 0.5rem;
            margin: 0.5rem 0;
            width: 100%;
            font-size: 1rem;
          }
          button {
            background: #007BFF;
            color: white;
            border: none;
            cursor: pointer;
          }
          button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>SOAP Calculator</h2>
          <form method="POST" action="/calculate">
            <input name="a" type="number" placeholder="Enter number A" required />
            <select name="operation">
              ${methodOptions}
            </select>
            <input name="b" type="number" placeholder="Enter number B" required />
            <button type="submit">Calculate</button>
          </form>
        </div>
      </body>
      </html>
    `);
  });
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
      res.send(`
        <html>
        <head>
          <title>Result</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #eef2f5;
              text-align: center;
              padding-top: 50px;
            }
            h3 {
              color: #444;
            }
            a {
              display: inline-block;
              margin-top: 20px;
              text-decoration: none;
              background: #007BFF;
              color: white;
              padding: 10px 15px;
              border-radius: 5px;
            }
            a:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <h3>Result of ${operation}(${a}, ${b}) = ${output}</h3>
          <a href="/">Back</a>
        </body>
        </html>
      `);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
