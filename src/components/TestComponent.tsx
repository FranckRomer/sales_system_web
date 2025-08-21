import { useState } from "react";

export default function TestComponent() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h2>Test Component</h2>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <p>Si ves esto, React está funcionando correctamente!</p>
        </div>
    );
}
