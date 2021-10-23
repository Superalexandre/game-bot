import NavBar from "./components/NavBar/NavBar"

function Home() {
    return (
		<div className="top-0 left-0 absolute w-full h-full dark">
            <NavBar></NavBar>

            <div className="dark:bg-gray-primary bg-white w-full h-full">
            </div>
        </div>
    )
}

export default Home