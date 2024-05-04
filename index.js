// ユーザーメッセージ受信フラグ
function doPost(e){
  let data = JSON.parse(e.postData.contents); //受信JSONデータをオブジェクト変換
  let events = data.events; //dataはテスト用に取っておきたいので、別途event指定
  let sheet= SpreadsheetApp.getActive().getSheetByName('保存：トーク内容'); //トーク内容保存シート指定
  for(let i = 0; i < events.length; i++){
    let event = events[i];
    if(event.type == 'message'){
      if(event.message.type == 'text'){ 
        sheet.appendRow([new Date(),event.source.userId,event.message.text])
      }
    } // メッセージ内容検索、登録
  }
for(let i = 0; i < events.length; i++){
    let event = events[i];
    if(event.type == 'message'){
      if(event.message.type == 'text'){ 
        if(event.message.text == 'ユーザー登録'){
        let contents = {
          replyToken: event.replyToken,
          messages: [{ type: 'text', text:  "ユーザー登録を行います。"}],
        };
        reply(contents,event.source.userId);
        }
      } // メッセージ内容がユーザー登録の場合、別途ユーザーIDを保存後、返信へ
    }
  }
}

// 返信
function reply(contents,userid){
  let sheetr= SpreadsheetApp.getActive().getSheetByName('登録請求');
  let channelAccessToken = "xxx";　//チャンネルアクセストークン
  let replyUrl = "https://api.line.me/v2/bot/message/reply"; 
  let options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + channelAccessToken
    },
    payload: JSON.stringify(contents) 
  };
  sheetr.appendRow([0,new Date(),userid]);
  UrlFetchApp.fetch(replyUrl, options);
}
