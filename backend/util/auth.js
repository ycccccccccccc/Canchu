const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    console.log('auth')
    var token = req.header('Authorization')
    
    // 確認token
    if ( !token ) {
        // Token not exist
        console.log('Authorization error!')
        return res.status(401).send({
            message: 'Token empty!'
        });
    }

    token = token.replace('Bearer ', '');
    // console.log(token);
    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        next();
    } catch (err) {
        res.status(403).json({
            message: "Can not find the user's mail from token."
        })
        return 'error';
    }
}

async function get_info_from_token(req, res){
    console.log('get_info_from_token')
    var token = req.header('Authorization')
    // 確認token
    token = token.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        return decoded
    } catch (err) {
        res.status(403).json({
            message: "Can not find the user's mail from token."
        })
        return 'error';
    }
}

module.exports = {
    auth,
    get_info_from_token
}
