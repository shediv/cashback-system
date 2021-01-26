import express from 'express';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import path from 'path';
import cors from "cors";

// Routes
import indexRoutes from './routes';
import rulesetRoutes from './routes/ruleset';
import transactionRoutes from './routes/transaction';
import cashbackRoutes from './routes/cashback';

class Applicaction {

    app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(cors({ origin: true }));
        this.settings();
        this.middlewares();
        this.routes();
    }

    settings() {
        this.app.set('port', 4000);
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.engine('.hbs', exphbs({
            layoutsDir: path.join(this.app.get('views'), 'layouts'),
            partialsDir: path.join(this.app.get('views'), 'partials'),
            defaultLayout: 'main',
            extname: '.hbs'
        }));
        this.app.set('view engine', '.hbs');
    }

    middlewares() {
        this.app.use(morgan('dev'));
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(express.json());
    }

    routes() {
        this.app.use('/', indexRoutes);
        this.app.use('/ruleset', rulesetRoutes);
        this.app.use('/transaction', transactionRoutes);
        this.app.use('/cashback', cashbackRoutes);

        // this.app.use(express.static(path.join(__dirname, 'public')));
    }

    start(): void {
        this.app.listen(this.app.get('port'), () => {
            console.log('>>> Server is running at', this.app.get('port'));
        });
    }
}

export default Applicaction;