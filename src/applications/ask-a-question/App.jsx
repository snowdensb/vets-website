import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

window.React = React;
window.ReactDOM = ReactDOM;

const BotActivityDecorator = ({ children }) => {
  return (
    <div className="botActivityDecorator">
        {children}
    </div>
  );
};

const activityMiddleware = () => next => (...setupArgs) => {
  const [card] = setupArgs;
  if (card.activity.from.role === 'bot') {
    return (...renderArgs) => (
      <BotActivityDecorator
        activityID={card.activity.id}
        key={card.activity.id}
      >
        {next(card)(...renderArgs)}
      </BotActivityDecorator>
    );
  }
  return next(...setupArgs);
};

export default function App() {
  const [isLoaded, setLoaded] = useState(!!window.WebChat);
  
  if(!isLoaded) {
    setTimeout(() => {
      if(window.WebChat) {
        setLoaded(true);     
      }
    }, 300)
    return 'waiting on webchat framework . . .'
  }

  return <ActualApp/>;
}

function ActualApp() {
  const { ReactWebChat, createDirectLine } = window.WebChat;

  const store = useMemo(() => createStore(), []);
  const directLine = useMemo(
    () =>
      createDirectLine({
        // domain:
        //   'https://northamerica.directline.botframework.com/v3/directline',
        token:
          'ew0KICAiYWxnIjogIlJTMjU2IiwNCiAgImtpZCI6ICJsY0oxTXFpNkdKYXdCZEw5Y0dieEt5S1R6OE0iLA0KICAieDV0IjogImxjSjFNcWk2R0phd0JkTDljR2J4S3lLVHo4TSIsDQogICJ0eXAiOiAiSldUIg0KfQ.ew0KICAiYm90IjogInZhYm90LWF6Y2N0b2xhYi1ib3QiLA0KICAic2l0ZSI6ICJ3b1ZDYXV2RzA2QSIsDQogICJjb252IjogIkt2STE3ZElteER5RmtFYkZGd1J4NU0tZCIsDQogICJuYmYiOiAxNjE0ODk0NDQ5LA0KICAiZXhwIjogMTYxNDg5ODA0OSwNCiAgImlzcyI6ICJodHRwczovL2RpcmVjdGxpbmUuYm90ZnJhbWV3b3JrLmNvbS8iLA0KICAiYXVkIjogImh0dHBzOi8vZGlyZWN0bGluZS5ib3RmcmFtZXdvcmsuY29tLyINCn0.hIRwC4lMhwzDrsbtkgBLZE100m6oDtvRp9spjAr8uJYe3QD2_xSA3AHABirtBe5CtVBBM7q373w2VSGrCZDs179CBLJUCCZAzcanagzaAgLyqEY8MBNSzBnjUDqtSFF_EVza_uOL7RhWoto-lClJUQm5lkf-49Oc0CrmgsA2qKc9urm-C7KR2Of24ZS8mqOrzw4k2pI3tZWrYg9SNsgZtwqR-ELK9Nt2WyTcm6FfDX2qW9RjSiKMWPG81IBfnkeWA92EZbQL_D9aHmjIYbfb2yVLmHwTwMSE6xiTeueTLDiygNSo1Tz30MDTAF0DGSDatrYKN1kbwl5kAYXxTGhGiw'
      }),
    [],
  );

  return (
    <div className={'vads-l-grid-container'}>
      <div className={'vads-l-row'} style={{height: '200px'}}>
        <ReactWebChat
          activityMiddleware={activityMiddleware}
          directLine={directLine}
          store={store}
          userID="12345"
        />
      </div>
    </div>
  );
}
