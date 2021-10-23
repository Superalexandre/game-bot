const Button = ({ text }) => {
    return (
        <div>
            <a href="https://discord.com/api/oauth2/authorize?client_id=848272310557343795&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fcallback%2Fdiscord&response_type=code&scope=identify%20email%20guilds">
                {text} 5000
            </a>
            <a href="https://discord.com/api/oauth2/authorize?client_id=848272310557343795&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fcallback%2Fdiscord&response_type=code&scope=identify%20email%20guilds">
                {text} 3000
            </a>
        </div>
    )
}

export default Button