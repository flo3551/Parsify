import { User } from "../models/user.model";
import { UserService } from "../services/user.service";

const passwordHash = require("password-hash");

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService;
    }

    public async signup(req: any, res: any) {
        const { password, email } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                text: "Requête invalide: il manque le paramètre 'email' ou 'password'."
            });
        }
        const user = new User(email, passwordHash.generate(password));

        try {
            const findUser = await this.userService.doesUserExists(user.email);

            if (findUser) {
                return res.status(400).json({
                    text: "L'utilisateur existe déjà"
                });
            }
        } catch (error) {
            console.log("error", error);
            return res.status(500).json({ error });
        }
        try {
            // Sauvegarde de l'utilisateur en base
            await this.userService.insertUser(user.email, user.password);
            return res.status(200).json({
                text: "Succès",
                token: user.getNewToken()
            });
        } catch (error) {
            console.log("error", error);
            return res.status(500).json({ error });
        }
    }


    public async login(req: any, res: any) {
        console.log("request received");
        const { password, email } = req.body;
        if (!email || !password) {
            //Le cas où l'email ou bien le password ne serait pas soumit ou nul
            return res.status(400).json({
                text: "Requête invalide"
            });
        }
        try {
            // On check si l'utilisateur existe en base
            const findUser = await this.userService.areCredentialsValid(email, password);
            if (!findUser) {
                return res.status(401).json({
                    text: "E-mail ou mot de passe incorrect."
                });
            }
            const user: User = await this.userService.selectUserByEmail(email);

            return res.status(200).json({
                token: user.getNewToken(),
                text: "Authentification réussie."
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error
            });
        }
    }
}