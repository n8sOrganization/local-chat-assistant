# 🖥️ Local Chat Assistant Guide  
Run a local chat assistant with **no internet required** after the model is downloaded and running.

---

## 🔧 Prerequisites

- Ollama  
- Node.js (via [NodeSource](https://github.com/nodesource/distributions) or [nvm](https://github.com/nvm-sh/nvm))  

---

## ✅ Step 1: Install Ollama

### **macOS**
```bash
brew install ollama
```

### **Linux**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

> ℹ️ You may need to add Ollama to your path or restart your terminal.

### **Windows**
1. Visit [https://ollama.com/download](https://ollama.com/download)  
2. Download and run the `.msi` installer  
3. Follow the installation prompts

---

## ✅ Step 2: Serve LLaMA Model Locally  
Run the Ollama server and load the LLaMA model:

```bash
ollama serve
ollama run llama3.2:latest
```

> 🧠 This will download the model if it’s not already on your system.

---

## ✅ Step 3: Install Node.js

### **macOS (with Homebrew)**
```bash
brew install node
```

### **Linux (NodeSource for Ubuntu/Debian)**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### **Windows**
1. Download Node.js LTS from [https://nodejs.org](https://nodejs.org)  
2. Run the installer and follow prompts  
3. Restart terminal or Command Prompt

---

## ✅ Step 4: Create a New Vite Project

```bash
npm create vite@latest llama-chat -- --template react
cd llama-chat
```

---

## ✅ Step 5: Install Dependencies

```bash
npm install
npm install lucide-react
```

---

## ✅ Step 6: Update App.jsx

Replace the contents of `src/App.jsx` with your preferred or repository-provided version.

> 🔁 Replace the URL with your actual source location.

---

## ✅ Step 7: Start the Dev Server

```bash
npm run dev
```

---

## ✅ Step 8: Use the Chat Assistant

Open your browser and navigate to:

```
http://127.0.0.1:5173
```

You now have a **fully local AI chat assistant** running on your machine 🎉

