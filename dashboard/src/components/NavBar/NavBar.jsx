import React from "react"
import Logo from "../../assets/logos/Logo.png"

const getRandomColor = () => {
    const colors = ["text-red", "text-green", "text-blue", "text-yellow"]
    
    return colors[Math.floor(Math.random() * colors.length)]
}

const getHoverColor = (tailwindClass) => `${tailwindClass} hover:${getRandomColor()}`

const NavBar = () => {
    const [NavBarOpen, setNavBarOpen] = React.useState(false)
    
    return (
        <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 bg-gray-secondary">
            <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
                <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
                    <a className={getHoverColor("text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-white")}
                    href="/">
                        <img className="h-16 inline-block mr-6" src={Logo} alt="Logo"/>
                        
                        Accueil

                        <i className="fas fa-home mx-1.5"></i>
                    </a>
                    <button
                        className="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                        type="button"
                        onClick={() => setNavBarOpen(!NavBarOpen)}
                    >
                    <i className="fas fa-bars"></i>
                    </button>
                </div>
                <div
                    className={
                    "lg:flex flex-grow items-center" +
                    (NavBarOpen ? " flex" : " hidden")
                    }
                    id="example-navbar-danger"
                >
                    <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
                        <li className="nav-item">
                            <a
                                className={getHoverColor("px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white")} 
                                href="/login">
                                Connexion

                                <i className="fas fa-sign-in-alt mx-1.5"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar