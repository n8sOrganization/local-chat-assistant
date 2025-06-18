# Local Chat Assistant
Run a chat assistant locally (no internet connection required)
<br><br>



#### Install Ollama

* Mac
```bash 
  brew install ollama
```

* Linux
```bash 
  curl -fsSL https://ollama.com/install.sh | sh
```

* Windows

  Download the installer from ollama.com

#### Serve Llama model locally
```bash
  ollama serve
  ollama run llama3.2:latest
```


#### Create new project with Vite
```bash
  npm create vite@latest llama-chat -- --template react
  cd llama-chat
```

#### Install dependencies
```bash
  npm install
  npm install lucide-react
```

  Replace local src/App.jsx content with repo App.jsx code

#### Start the dev server
```bash
  npm run dev
```

#### Access your chat assistant with your local browser
```bash
  http://127.0.0.1:11434
```



