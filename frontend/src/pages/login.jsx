import {useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import {useAuth} from "../context/Authcontext";

export default function Login(){
    const {login}=useAuth();
    const navigate=useNavigate();
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [submitting ,setSubmitting]=useState(false);
    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        if(!email||!password){
            setError("Email and password are required");
            return;
        }
        setSubmitting(true);
        try{
            await login(email,password);
            navigate("/home");
        }catch(err){
            setError(err.message||"Login failed");
        }finally{
            setSubmitting(false);
        }
    }
    return(
       <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-brand">Zoomlite</div>
                    <h1 className="auth-title">Log in to your account</h1>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label htmlFor="email">Email</label>
                            <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        />
                    </div>

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Logging in…" : "Log in"}
                    </button>
                </form>

                <div className="auth-switch">
                  Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );             

    
}
