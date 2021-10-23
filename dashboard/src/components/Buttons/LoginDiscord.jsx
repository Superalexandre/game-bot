const Button = ({ text }) => {
    return (
        <a href="https://discord.com/api/oauth2/authorize?client_id=848272310557343795&redirect_uri=localhost%3A300%2Fapi%2Fcallback%2Fdiscord&response_type=code&scope=identify%20email%20guilds">
            {text}
        </a>
    )
}

export default Button