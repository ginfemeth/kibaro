import bcrypt from 'bcryptjs';

const hashPassword = (pwdStr: string): string => {
    let saltRound = 12;
    const hashedPwd: string = bcrypt.hashSync(pwdStr, saltRound);
    return hashedPwd;
};

export {
    hashPassword
};