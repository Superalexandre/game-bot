import Logo from "../../assets/logos/Logo.png"

const customColor = () => {
    const colors = ["text-red", "text-green", "text-blue", "text-yellow"]
    
    return colors[Math.floor(Math.random() * colors.length)]
}

const className = () => `block text-white text-center hover:${customColor()} p-10 font-bold`

const NavBar = () => {
    return (
        <div className="absolute h-full w-60 dark:bg-gray-secondary bg-gray">
            <div>
                <a href="/" className={className()}>Accueil</a>
    
                <a href="/login" className={className()}>Se connecter</a>
            </div>
            <div className="bottom-0 left-0 right-0 ml-auto mr-auto absolute p-11">
                <img className="h-32 left-0 right-0 ml-auto mr-auto" src={Logo} alt="Logo"/>
                <p className="text-white text-center p">Game Bot</p>
            </div>
        </div>
    )
}

export default NavBar