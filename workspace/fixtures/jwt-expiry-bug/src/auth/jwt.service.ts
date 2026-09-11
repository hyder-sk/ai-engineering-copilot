import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtService {
  verify(token: string): { sub: string; exp: number } {
    // Bug: ignores expiration entirely
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8") ||
        "{}",
    );
    return {
      sub: String(payload.sub ?? "unknown"),
      exp: Number(payload.exp ?? 0),
    };
  }

  isValid(token: string): boolean {
    // Bug: never checks exp against Date.now()
    const payload = this.verify(token);
    return Boolean(payload.sub);
  }
}
