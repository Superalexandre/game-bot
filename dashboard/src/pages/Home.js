import NavBar from "../components/NavBar/NavBar"
import { Component } from "react"

class Home extends Component {
    render() {   
        return (
		    <div className="top-0 left-0 absolute w-full h-full dark">
                <NavBar></NavBar>

                <div className="dark:bg-gray-primary bg-white w-full h-full">
                    <p>Home</p>
                </div>
            </div>
        )
    }
}

export default Home