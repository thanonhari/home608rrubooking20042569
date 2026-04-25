const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
const WEB_APP_URL = PropertiesService.getScriptProperties().getProperty('PHP_BRIDGE_URL');
const GAS_SECRET_KEY = 'RRU_LINE_SECURE_2026';

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const event = contents.events[0];
    if (!event) return;

    const replyToken = event.replyToken;
    const userId = event.source.userId;
    let payload = {
      'key': GAS_SECRET_KEY,
      'line_user_id': userId,
      'action': 'line_message'
    };

    if (event.message.type === 'text') {
      payload.message = event.message.text;
    } 
    else if (event.message.type === 'image') {
      const imageId = event.message.id;
      const imageUrl = 'https://api-data.line.me/v2/bot/message/' + imageId + '/content';
      const response = UrlFetchApp.fetch(imageUrl, {
        'headers': { 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN }
      });
      payload.action = 'payment_slip';
      payload.image_data = Utilities.base64Encode(response.getBlob().getBytes());
      payload.file_name = 'slip_' + imageId + '.jpg';
    }

    // ส่งข้อมูลไป PHP
    if (WEB_APP_URL) {
      const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(payload),
        'muteHttpExceptions': true
      };
      const res = UrlFetchApp.fetch(WEB_APP_URL, options);
      const resData = JSON.parse(res.getContentText());
      
      // รองรับการตอบกลับแบบหลายข้อความ (Array) หรือข้อความเดียว
      if (resData.messages && Array.isArray(resData.messages)) {
        replyMessage(replyToken, resData.messages);
      } else {
        replyMessage(replyToken, [{ 'type': 'text', 'text': resData.message }]);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function replyMessage(replyToken, messages) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
    'method': 'post',
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages
    })
  });
}
