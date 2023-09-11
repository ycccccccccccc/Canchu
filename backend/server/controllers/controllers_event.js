const { get_info_from_token } = require('../../util/auth')
const { get_event, read_event, get_event_from_event_id } = require('../models/models_event')

const get_event_controller = async (req, res) => {
    const user_info = await get_info_from_token(req, res);
    const user_id = user_info.id;
    
    try{
      const events = await get_event(user_id);
      return res.status(200).json({
        data: {
          events: events
        }
      });
    } catch (err) {
        return res.status(500).json({
            message: 'Get error!',
        });
    }
}

const read_event_controller = async (req, res) => {
    const user_info = await get_info_from_token(req, res);
    const user_id = user_info.id;
    const event_id = parseInt(req.params.event_id);
  
    try{
        const event_info = await get_event_from_event_id(event_id);
        if(event_info[0].user_id == user_id){
            const read_event_result = await read_event(event_id);
            if(read_event_result){
                return res.status(200).json({
                event: {
                    id: event_id
                }
                });
            }
            else{
                return res.status(400).json({
                message: 'Update error (Wrong event id!)',
                });
            }
        }
        else{
        return res.status(400).json({
            message: "Permission denied (Token id and event's user id are different)",
        });
        }
  
    } catch (err) {
        return res.status(500).json({
        message: 'Update error!',
        });
    }
  }

module.exports = {
    get_event_controller,
    read_event_controller
}