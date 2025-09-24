import { useState } from "react";
import { API_KEY, URL } from "./constants";
import { Answer } from "./components/Answer";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState([]);

  async function handleAsk() {
    const payload = {
      contents: [
        {
          parts: [{ text: question }],
        },
      ],
    };

    let response = await fetch(URL + API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    response = await response.json();

    // ✅ Access .text and split correctly
    let dataString = response.candidates[0].content.parts[0].text;

    // Split by "* " or newline and clean up
    let parts = dataString
      .split(/\* |\n/) // split by * or newline
      .map((item) => item.trim())
      .filter(Boolean);

    // ✅ Structure the result into objects
    const structured = parts.map((text, index) => ({
      type: index === 0 ? "q" : "a", // first = question, rest = answers
      text,
    }));

    console.log(structured);
    setResult(structured);
  }

  return (
    <>
      <div className="grid grid-cols-5 h-screen text-center">
        <div className="col-span-1 bg-zinc-700"></div>
        <div className="col-span-4 bg-zinc-800">
          <div
            className="container overflow-y-scroll p-4 text-left"
            style={{ height: "30rem" }}
          >
            <div className="text-white space-y-2">
              <ul>
                {result.map((item, index) => (
                  <li key={index} className="text-left p-1">
                    <Answer
                      ans={item.text}
                      type={item.type}
                      totalResult={result.length}
                      index={index}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900 w-1/2 p-1 pr-5 text-white m-auto rounded-3xl border border-zinc-700 flex h-16 items-center space-x-2">
            <input
              type="text"
              placeholder="Ask me anything"
              className="w-full h-full p-3 outline-none bg-zinc-800"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              className="bg-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-600 transition"
              onClick={handleAsk}
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
