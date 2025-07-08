const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Βάζουμε το React build να είναι διαθέσιμο
app.use(express.static(path.join(__dirname, '../client/build')));

// Αν κάποιος μπει σε όποιον άλλο σύνδεσμο, να του δείχνει το index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server τρέχει στη θύρα ${PORT}`);
});
