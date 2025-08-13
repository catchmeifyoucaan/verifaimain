import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', async () => {
  render(<App />);
  const welcomeElement = await screen.findByText((content, element) => {
    return element.tagName.toLowerCase() === 'h1' && element.textContent === 'Welcome to VerifAi'
  });
  expect(welcomeElement).toBeInTheDocument();
});
