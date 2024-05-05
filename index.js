function doPost(e){
  let data = JSON.parse(e.postData.contents) //JSONをオブジェクト型に変換
  const events = data.events; //イベント類を取り出す
  for (var i = 0; i < events.length; i++){
    execute(events[i]);
  } //それぞれのイベントについて、必要な処理を行う。
}

// それぞれのイベントについての処理
function execute(event){
  const eventType = event.type;
  const replyToken = event.replyToken;
  const userId = event.source.userId;

  //　スプレッドシートを準備
  let sheet = SpreadsheetApp.getActive().getSheetByName("登録請求")
  let sheetr = SpreadsheetApp.getActive().getSheetByName("保存トーク内容")

  //　友達追加時、シートにUserIdを記録。登録フラグを1とする。
  if(eventType === "follow"){
    sheet.appendRow([new Date(),userId,1])
    let contents = {
      replyToken: replyToken,
      messages: [{type: "text", text: "友達追加、ありがとうございます！\nまずはイベントのスケジュール送信、リマインドのためにユーザー登録を行ってください。\nユーザーネームを送信してください。"}] 
    }
    //　メッセージ送信
    reply(contents)
  }

  //　登録フラグが1の時、シートにメッセージを記録。登録フラグを2とする。
  if(eventType == "message" && searchKeyword(userId) != 0 && sheet.getRange(searchKeyword(userId,1)).getValue() == 1){
    sheet.getRange(searchKeyword(userId,2)).setValue(event.message.text)
    sheet.getRange(searchKeyword(userId,1)).setValue(2)
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"内容を保存しました。\n次に、所属大学を送信してください。\n例:東京理科大学"}]
    }
    //　メッセージ送信
    reply(contents)

  //　登録フラグが2の時、シートにメッセージを記録。登録フラグを3とする。
  }else if(eventType == "message" && searchKeyword(userId) != 0 && sheet.getRange(searchKeyword(userId,1)).getValue() == 2){
    sheet.getRange(searchKeyword(userId,3)).setValue(event.message.text)
    sheet.getRange(searchKeyword(userId,1)).setValue(3)
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"内容を保存しました。\n次に、学年を送信してください。\n例:2"}]
    }
    //　メッセージ送信
    reply(contents)

//　登録フラグが3の時、シートにメッセージを記録。登録フラグを4とする。
  }else if(eventType == "message" && searchKeyword(userId) != 0 && sheet.getRange(searchKeyword(userId,1)).getValue() == 3){
    sheet.getRange(searchKeyword(userId,4)).setValue(event.message.text)
    sheet.getRange(searchKeyword(userId,1)).setValue(4)
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:`内容を保存しました。次の内容で保存されます。\n${sheet.getRange(searchKeyword(userId,2)).getValue()}さん\n${sheet.getRange(searchKeyword(userId,3)).getValue()}\n${sheet.getRange(searchKeyword(userId,4)).getValue()}学年\nよろしければYを、変更したい場合はCを、登録をやめたい場合はNを半角で送信してください。`}]
    }
    //　メッセージ送信
    reply(contents)

  //　登録フラグが4の時、メッセージによって機能分岐。それぞれ、内容保存、再登録、内容消去を行う。
  }else if(eventType == "message" && searchKeyword(userId) != 0 && sheet.getRange(searchKeyword(userId,1)).getValue() == 4 && event.message.text=="Y"){
    sheet.getRange(searchKeyword(userId,4)).setValue(event.message.text)
    sheet.getRange(searchKeyword(userId,1)).setValue(5)
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"内容を保存しました。"}]
    }
    reply(contents)
  }else if(eventType == "message" && searchKeyword(userId) != 0 && sheet.getRange(searchKeyword(userId,1)).getValue() == 4 && event.message.text=="C"){
    sheet.getRange(searchKeyword(userId,1)).setValue(0)
    sheet.getRange(searchKeyword(userId,2)).setValue(0)
    sheet.getRange(searchKeyword(userId,3)).setValue(0)
    sheet.getRange(searchKeyword(userId,4)).setValue(0)
    sheet.getRange(searchKeyword(userId,1)).setValue(1)
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"再登録します。\nユーザー名を送信してください。"}]
    }
    //　メッセージ送信
    reply(contents)
  }else if(eventType == "message" && searchKeyword(userId) != 0 && sheet.getRange(searchKeyword(userId,1)).getValue() == 4 && event.message.text=="N"){
    sheet.getRange(searchKeyword(userId,1)).setValue("")
    sheet.getRange(searchKeyword(userId,2)).setValue("")
    sheet.getRange(searchKeyword(userId,3)).setValue("")
    sheet.getRange(searchKeyword(userId,4)).setValue("")
    sheet.getRange(searchKeyword(userId,1)).setValue(1)
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"登録を終了します。\n再登録したい場合はユーザー名を入力してください。"}]
    }
    //　メッセージ送信
    reply(contents)

  //　テスト用処理。登録情報リセット。
  }else if(eventType == "message" && searchKeyword(userId) != 0 && sheet.getRange(searchKeyword(userId,1)).getValue() == 5 && event.message.text=="リセットリクエスト"){
    sheet.getRange(searchKeyword(userId,-1)).setValue("")
    sheet.getRange(searchKeyword(userId,1)).setValue("")
    sheet.getRange(searchKeyword(userId,2)).setValue("")
    sheet.getRange(searchKeyword(userId,3)).setValue("")
    sheet.getRange(searchKeyword(userId,4)).setValue("")
    sheet.getRange(searchKeyword(userId,0)).setValue("")
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"登録情報をリセットします。\n再登録したい場合はブロックしてから解除を行ってください。"}]
    }
    //　メッセージ送信
    reply(contents)

  //　エラー処理。友達追加した後に、管理者がデータを削除すると発生する。ブロ解後、登録し直すこと。
  }else if(searchKeyword(userId) == 0){
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"データベースにあなたのIDが登録されていません。\n管理者に問い合わせてください。"}]
    }
    //　メッセージ送信
    reply(contents)

  //　例外処理。フラグが立っていない時に、メッセージを保存する。
  }else{
    if(eventType=="message"){
    sheetr.appendRow([new Date(),userId,event.message.text])
    }
    contents = {
      replyToken: replyToken,
      messages:[{type:"text",text:"はへぇ、、、"}]
    }
    //　メッセージ送信
    reply(contents)
  }
}

//　キーワードを検索し、得たポイントを列番号に変換する関数
function searchKeyword(keyword,offset) {
  var sheet = SpreadsheetApp.getActive().getSheetByName("登録請求")
  var data = sheet.getDataRange().getValues();
  var result = [];

  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      if (data[i][j] === keyword) {
        var row = i + 1;
        var column = getColumnLetter(j + 1 + offset);
        result.push(column + row);
      }
    }
  }
  if(result.length==0){
   result.push(0)
  }

  return result[0];
}

// 列番号をアルファベットの列名に変換する関数
function getColumnLetter(column) {
  var temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

// メッセージ送信機能
function reply(contents){
  //　チャネルアクセストークン
  let channelAccessToken = "xxx";
  
  let replyUrl = "https://api.line.me/v2/bot/message/reply"; 
  let options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + channelAccessToken
    },
    payload: JSON.stringify(contents) 
  };
  UrlFetchApp.fetch(replyUrl, options);
}
