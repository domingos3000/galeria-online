require('dotenv').config();
import 'express-async-errors'; 
import app from './server';



const port = process.env.PORT || 5000;


app.listen(port, () => console.log("Rodando...🚀"))