// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: futbol;
  async function getMatchesData() {
    try {
      const request = new Request("https://fantasy.dfkdainava.com/api/widget-matches");

      return await request.loadJSON();
    } catch (err) {
      console.log(err);

      return {"last_match": null, "upcoming_match": null};
    }
  }

  async function createWidget() {
    let listWidget = new ListWidget();
    let matchesData = await getMatchesData();
    
    listWidget.backgroundColor = new Color('#A90000');

    if (config.widgetFamily === 'small' && matchesData.upcoming_match) {
      addSmallUpcomingMatch(listWidget, matchesData.upcoming_match);

      return listWidget;
    }

    if (matchesData.upcoming_match) {
      let headerText = listWidget.addText('Artėjančios rungtynės');
      headerText.centerAlignText();
      headerText.font = Font.boldSystemFont(16);
      headerText.textColor = new Color("#FFFFFF");
      
      listWidget.addSpacer(8);

      await addMatch(listWidget.addStack(), matchesData.upcoming_match);
    } else {
      let headerText = listWidget.addText('Nėra informacijos apie artėjančias rungtynes');
      headerText.centerAlignText();
      headerText.textColor = new Color("#FFFFFF");
    }

    if (config.widgetFamily === "large" && matchesData.last_match) {
      listWidget.addSpacer(16);

      let headerText = listWidget.addText('Praėjusios rungtynės');
      headerText.centerAlignText();
      headerText.font = Font.boldSystemFont(16);
      headerText.textColor = new Color("#FFFFFF");
      
      listWidget.addSpacer(8);

      await addMatch(listWidget.addStack(), matchesData.last_match);
    }
    
    return listWidget;
  }

  async function addMatch(stack, match) {
    let teamInfo = stack.addStack();
    teamInfo.spacing = 8;
    stack.centerAlignContent();

    await addTeamInfo(teamInfo.addStack(), match.home_team);

    if (match.score) {
      addScore(teamInfo.addStack(), match.score);
    } else {
      addDate(teamInfo.addStack(), new Date(match.timestamp * 1000), match.weekday, match.show_time);
    }

    await addTeamInfo(teamInfo.addStack(), match.away_team);
  }

  async function addTeamInfo(stack, team) {
    stack.layoutVertically();
    stack.centerAlignContent();
    stack.addSpacer();
    
    let imageStack = stack.addStack();
    imageStack.addSpacer();
    let widgetImage = imageStack.addImage(await new Request(team.image).loadImage());
    widgetImage.centerAlignImage();
    imageStack.addSpacer();

    stack.addSpacer(8);
    
    let text = addCenteredText(stack.addStack(), team.name);
    text.font = Font.regularSystemFont(10);

    stack.addSpacer();
  }

  function addDate(stack, date, weekday, showTime) {
    stack.layoutVertically();
    stack.centerAlignContent();
    stack.addSpacer();

    let timeText = addCenteredText(stack.addStack(), showTime ? date.toLocaleTimeString().slice(0, 5) : "-");
    timeText.font = Font.semiboldSystemFont(24);

    stack.addSpacer();

    let dateText = addCenteredText(stack.addStack(), date.toISOString().substr(5,5));
    dateText.font = Font.semiboldSystemFont(24);

    stack.addSpacer();
    
    let weekdayText = addCenteredText(stack.addStack(), weekday.charAt(0).toUpperCase() + weekday.slice(1));
    weekdayText.font = Font.regularSystemFont(12);

    stack.addSpacer();
  }

  function addScore(stack, score) {
    stack.layoutVertically();
    stack.centerAlignContent();
    stack.addSpacer();

    let scoreText = addCenteredText(stack.addStack(), score);
    scoreText.font = Font.semiboldSystemFont(24);

    stack.addSpacer();
  }

  function addCenteredText(textStack, content) {
    textStack.addSpacer();

    let text = textStack.addText(content);
    text.centerAlignText();
    text.textColor = new Color("#FFFFFF");

    textStack.addSpacer();

    return text;
  }

  function addSmallUpcomingMatch(widget, match) {
    let stack = widget.addStack();
    stack.layoutVertically();

    addCenteredText(stack.addStack(), match.home_team.name);

    stack.addSpacer();
    
    let dateStack = stack.addStack();
    dateStack.layoutVertically();

    let date = new Date(match.timestamp * 1000);
    let dateString = date.toISOString().substr(5, 5);
    
    if (match.show_time) {
      dateString += ' ' + date.toLocaleTimeString().slice(0, 5)
    }

    addCenteredText(dateStack.addStack(), dateString);
    addCenteredText(dateStack.addStack(), match.weekday.charAt(0).toUpperCase() + match.weekday.slice(1));

    stack.addSpacer();

    addCenteredText(stack.addStack(), match.away_team.name);
  }

  let widget = await createWidget();

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    widget.presentLarge();
  }

  Script.complete();
