{{#if useAuth}}
import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/auth/sign-up" element={<SignUp />} />
      <Route path="*" element={<div>Not found.</div>} />
    </Routes>
  );
}
{{else}}
import { Route, Routes } from "react-router";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<div>Not found.</div>} />
    </Routes>
  );
}
{{/if}}

export default App;
