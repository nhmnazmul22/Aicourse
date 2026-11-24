# A Beginner’s Guide to This Portfolio Website

This tutorial explains the portfolio and its AI career chat from the ground up. It assumes you are new to frontend development. You do not need to memorize every line; focus on how the pieces connect, then use the examples as a map when you want to change something.

## 1. What technologies does the project use?

| Technology | What it does here |
|---|---|
| **HTML** | Gives the page its meaning and structure: headings, sections, links, forms, and buttons. |
| **CSS** | Controls the visual design: layout, colors, spacing, typography, and mobile behavior. |
| **JavaScript / TypeScript** | Adds behavior, such as sending a chat message. TypeScript adds checks that help catch mistakes while coding. |
| **React** | Lets us build the page from reusable pieces called components. |
| **Next.js** | Provides the application framework, page routing, server code, and production build tools. |
| **OpenRouter** | Receives the chat request on the server and forwards it to the selected AI model. |

This project uses the **Next.js App Router**. Files inside `src/app` define the website. A `page.tsx` file creates a page, and a `route.ts` file can create an API endpoint. React components use JSX, a syntax that lets you describe HTML-like elements inside TypeScript.

## 2. How a browser displays the site

When someone opens the portfolio, Next.js reads the page component and returns HTML for the browser. The browser then applies the CSS. For the chat, React also runs in the browser so it can react to typing, clicks, loading, and incoming replies.

The chat flow is:

```text
Visitor types a question
        ↓
ChatTwin component sends POST /api/chat
        ↓
Next.js API route adds the career profile and secret key
        ↓
OpenRouter runs openai/gpt-oss-120b
        ↓
API route returns the answer
        ↓
ChatTwin displays the answer with readable formatting
```

The OpenRouter key belongs on the server. The browser must never receive it: anything sent to browser code can be inspected by visitors.

## 3. Project map

```text
src/app/
  layout.tsx          Shared HTML wrapper and page metadata
  page.tsx            Portfolio content and section layout
  globals.css         Site-wide and responsive styles
  ChatTwin.tsx        Interactive chat UI (runs in the browser)
  api/chat/route.ts   Server endpoint that calls OpenRouter
package.json          Dependencies and run/build commands
.env                 Private local configuration (do not publish)
```

`Nhm-Nazmul-CV.pdf` supplied the profile information used for the biography, timeline, skills, and AI career context.

## 4. The portfolio page

In `page.tsx`, the page is built from sections such as the introduction, experience, projects, skills, and footer. A React component is a function that returns JSX. For example, the navigation is ordinary HTML elements expressed as JSX:

```tsx
<nav aria-label="Main navigation">
  <a href="#about">About</a>
  <a href="#journey">Journey</a>
  <a href="#work">Selected work</a>
  <a href="#digital-twin">AI twin</a>
</nav>
```

The `href` values beginning with `#` jump to elements with matching `id` values. For example, `href="#work"` moves to `<section id="work">`. `aria-label` gives assistive technology a useful name for the navigation.

### Data-driven project cards

The projects are kept in an array near the top of `page.tsx`:

```tsx
const projects = [
  {
    name: 'Drive Flow',
    category: 'Mobility · REST API',
    description: 'A role-based car rental API with secure booking flows.',
    stack: ['Node.js', 'Express', 'MongoDB', 'JWT'],
  },
  // Other projects follow the same shape.
]
```

An array is a list of values. Each project is an object whose named properties hold its content. Later, `.map()` makes one card for every project:

```tsx
{projects.map((project) => (
  <article className="project-card" key={project.name}>
    <h3>{project.name}</h3>
    <p>{project.description}</p>
  </article>
))}
```

The `{...}` means “evaluate this JavaScript expression.” `key` helps React identify each item if the list changes. Keeping content in data makes it easier to update a card without copying and editing a large block of markup.

## 5. Styling and responsive layout

`globals.css` defines design values such as colors at the top:

```css
:root {
  --paper: #f4f5f5;
  --ink: #101319;
  --blue: #2853e8;
}

body {
  background: var(--paper);
  color: var(--ink);
}
```

Names beginning with `--` are CSS custom properties (often called variables). `var(--paper)` reuses a value. This makes a site-wide color change much easier than searching for every copy of a hex color.

CSS Grid is used for larger page layouts. A media query changes the layout on smaller screens:

```css
.chat-layout {
  display: grid;
  grid-template-columns: .8fr 1.2fr;
  gap: 75px;
}

@media (max-width: 650px) {
  .chat-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
```

On a wide screen there are two columns. Below 650 pixels, the same content becomes one column. This is called responsive design. The CSS also includes a reduced-motion preference so people who ask their device to limit animation get less motion.

## 6. The interactive chat component

`ChatTwin.tsx` starts with `'use client'`. This tells Next.js that this component needs browser features such as React state and click handlers. The rest of the portfolio page can remain a server-rendered component.

The component tracks four pieces of state:

```tsx
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [busy, setBusy] = useState(false)
const [error, setError] = useState('')
```

`useState` stores a value between renders. When a setter such as `setInput` changes that value, React redraws the part of the page that depends on it. `Message[]` means “a list of messages”; each message has a role (`user` or `assistant`) and text content.

When the visitor submits the form, the `submit` function stops the browser’s normal page reload, checks that the question is not empty, and sends the conversation to the local API route:

```tsx
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: next }),
})
```

`fetch` makes an HTTP request. `POST` is used to send data. `JSON.stringify` converts JavaScript objects into JSON text, a common format for APIs. The path `/api/chat` is handled by the Next.js route described below.

While waiting, the component sets `busy` to `true`, which disables the send button and shows “Thinking…”. A `try/catch/finally` block handles success and failure: `catch` displays an error, and `finally` clears the loading state whether the request succeeded or failed.

## 7. The server API and OpenRouter

The file `src/app/api/chat/route.ts` exports a `POST` function. Next.js calls it when the browser sends `POST /api/chat`.

First, the route reads the key from the server environment:

```ts
const apiKey = process.env.OPEN_ROUTER_KEY
if (!apiKey) {
  return NextResponse.json(
    { error: 'Chat is not configured yet.' },
    { status: 503 },
  )
}
```

`process.env` is how Node.js reads environment variables. The route returns an error if the key is missing, instead of attempting an unauthenticated request. Keep the key in the root `.env` file as `OPEN_ROUTER_KEY=...`; do not put it in a file under `src`, add a `NEXT_PUBLIC_` prefix, or commit it to a public repository. `.gitignore` excludes `.env` from Git.

The route checks the submitted message list and limits its size before using it. It then sends a request to OpenRouter:

```ts
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://nhmnazmul.vercel.app',
    'X-Title': 'Nazmul Hasan Mamun Digital Twin',
  },
  body: JSON.stringify({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: careerContext },
      ...messages,
    ],
  }),
})
```

The `Authorization` header proves the request is allowed to use the key. The `model` field selects the model. `careerContext` is a server-side profile and instruction telling the model to answer from the CV and avoid inventing facts. The `...messages` syntax spreads the visitor’s conversation after the system instructions, so the model can use the current chat for context.

If OpenRouter returns a failure, the route sends a generic error to the browser rather than exposing internal details. On success, it extracts the answer from `choices[0].message.content` and returns it as JSON.

## 8. Turning Markdown into readable chat

The model may answer with Markdown conventions such as `### Heading`, `- bullet`, and `**bold**`. If we put that text directly in a paragraph, the browser displays the punctuation literally. `FormattedReply` in `ChatTwin.tsx` converts supported Markdown patterns into React elements.

For example, it recognizes a heading:

```tsx
const heading = line.match(/^#{1,3}\s+(.+)$/)
if (heading) {
  rendered.push(<h4 key={`h-${i}`}>{inline(heading[1])}</h4>)
}
```

The regular expression checks whether a line begins with one to three `#` characters followed by a space. The matched heading text is rendered as an HTML heading. Similarly, consecutive bullet lines are collected and rendered as `<ul>` and `<li>` elements. Pipe-separated lines are displayed as a simple table. Inline formatting handles bold, italics, and HTTP/HTTPS Markdown links.

The formatter intentionally creates React elements and text; it does not inject raw HTML. This is safer than using `dangerouslySetInnerHTML`. It is a small formatter for the response styles in this chat, rather than a complete Markdown implementation.

## 9. Page metadata and search previews

`layout.tsx` defines the common document wrapper and metadata:

```tsx
export const metadata: Metadata = {
  title: 'Nazmul Hasan Mamun — Full Stack Developer',
  description: 'Full stack developer building thoughtful digital products…',
}
```

Metadata is information about the page, not usually visible in its main content. Browsers and search or social platforms can use it for tab titles and link previews. `RootLayout` wraps the page in `<html>` and `<body>` and imports the global stylesheet.

## 10. Making changes and running the site

From the project directory, the usual commands are:

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`. Stop the local server with `Ctrl+C`. For a production build, use `npm run build`; to run that build locally, use `npm start` after the build succeeds.

To update project content, edit the data near the top of `src/app/page.tsx`. To change visual design, edit `src/app/globals.css`. To update what the Digital Twin knows, edit `careerContext` in `src/app/api/chat/route.ts`. For deployment, add `OPEN_ROUTER_KEY` to the hosting provider’s server-side environment settings; a local `.env` file is not automatically uploaded.

## 11. Five ideas for improving the code

1. **Use a full Markdown renderer.** The current formatter handles common headings, bullets, bold, italics, links, and simple tables. A maintained Markdown library would support nested lists, code blocks, block quotes, and edge cases more reliably. Configure it to disallow unsafe HTML.
2. **Move profile content into one shared data module.** The biography appears in the portfolio and in the AI context separately. A typed profile file could become the source for both, reducing the chance that one gets updated while the other stays stale.
3. **Add stronger API protection.** The endpoint limits message count and length, but a public deployment should also consider rate limiting, request-size limits, and usage/cost monitoring to discourage abuse.
4. **Improve chat usability.** Add a “clear conversation” button, preserve a draft on recoverable errors, announce loading and new replies accessibly, and provide a retry control.
5. **Add automated checks and component separation.** The chat component currently contains its request logic, state, formatter, and full markup together. Splitting these into smaller components and adding tests for formatting and API validation would make future changes easier to review.
