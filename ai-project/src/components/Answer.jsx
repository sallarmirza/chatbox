import React, { useEffect, useState } from "react";
import { checkHeading, replaceHeading } from "./Helper";

export const Answer = ({ ans, index,totalResult }) => {
  const [heading, setHeading] = useState(false);
  const [answer, setAnswer] = useState(ans);

  useEffect(() => {
    if (checkHeading(ans)) {
      setHeading(true);
      setAnswer(replaceHeading(ans)); // strip heading markers
    }
  }, [ans]);

  return (
    <div>
      {index==0 && totalResult>1 ? (
        <span className="text-white">{answer}</span>
      ) : heading ? (
        <span className="py-2 text-lg block text-white font-semibold">
          {answer}
        </span>
      ) : (
        <span className="pl-5 text-lg text-zinc-300">{answer}</span>
      )}
    </div>
  );
};
