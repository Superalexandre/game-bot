import NavBar from "../components/NavBar/NavBar"
import LoginButtonDiscord from "../components/Buttons/LoginDiscord"
import { Component } from "react"

class Login extends Component {
    render() {
        return (
		    <div className="top-0 left-0 absolute w-full h-full dark">
                <NavBar></NavBar>

                <div className="dark:bg-gray-primary bg-white w-full h-full">
                    
                    <div>

                        <LoginButtonDiscord
                            text="Connectez vous avec Discord"
                        >
                        </LoginButtonDiscord>

                    </div>

                </div>
            </div>
        )
    }
}

export default Login