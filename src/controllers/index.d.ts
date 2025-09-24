// e:\Software_development\bestBuys_buyingAndSelling\backend\src\types\express\index.d.ts
import { JwtPayload } from '../../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
