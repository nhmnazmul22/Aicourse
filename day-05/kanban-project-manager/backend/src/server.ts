import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3001;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
