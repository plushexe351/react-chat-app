import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { ChatContext } from "../context/ChatContext";

const Login = () => {
  const { dispatch } = useContext(ChatContext);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      dispatch({
        type: "CHANGE_USER",
        payload: {},
      });

      navigate("/");
    } catch (err) {
      setLoading(false);
      setErr(true);
    }
  };
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Twixt Chat</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" name="" id="" />
          <input type="password" placeholder="password" name="" id="" />
          <button disabled={loading}>
            {loading ? (
              <div className="loading-progress"></div>
            ) : (
              <div className="btn">Login</div>
            )}
          </button>
          {err && (
            <span style={{ color: "darkmagenta" }}>
              {" "}
              Invalid credentials. Try again !
            </span>
          )}
        </form>
        <p>
          Don't have an account?{" "}
          <Link className="link" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
