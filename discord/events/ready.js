export default class Ready {
    constructor(client) {
        this.client = client
    }

    async run() {
        const client = this.client

        client.logger.log({ message: "Client connecté" })

        //const headers = {
        //    "Content-Type": "application/json",
        //    "Authorization": "mfa.u_bJqaWbob31U30z1mj_lYQZFpH91UYD-2tk_7EBaMQN5TZcBkp3AJ4J8M57i5XKMLzTteKRj7yKHYrCe875"
        //}
        //
        //const req = await fetch("https://discord.com/api/v9/users/@me", {
        //    method: "PATCH",
        //    headers: headers,
        //    body: JSON.stringify({ bio: "TEST" })
        //})
        //
        //console.log(await req.json())
    }
}