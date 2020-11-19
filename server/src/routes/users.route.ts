import { UserController } from "../controllers/user.controller";

export class UsersRoute {
    private app: any;
    private userController: UserController;

    constructor(app: any) {
        this.app = app;
        this.userController = new UserController();
        this._setupRoutes();
    }

    private _setupRoutes() {
        this.app.post('/login', this.userController.login.bind(this.userController));
        this.app.post('/signup', this.userController.signup.bind(this.userController));
    }
}