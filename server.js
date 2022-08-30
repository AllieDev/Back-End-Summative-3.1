//Starts - Done by Ali (31-Aug) ---------------------------
const port = 3000;
const express = require("express");
const app = express();
//Ends - Done by Ali ---------------------------------------

//Starts - Done by Ali (31-Aug) ---------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
});
//Ends - Done by Ali ---------------------------------------
