import app from './app.js';
import { config } from './config/config.js';

app.listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port}`);
});