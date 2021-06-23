var email_view_loaded;

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  email_view_loaded = document.getElementById('#display-email-view');
  load_email_view();
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      //console.log(emails);
      // ... do something else with emails ...
      const newTable = document.createElement('div');
      newTable.className = 'container';
      document.querySelector('#emails-view').appendChild(newTable);
      for (i=0; i<emails.length; i++ ){
        
        const newRow = document.createElement('div');
        newRow.className = 'row';
        newRow.style.cursor = 'pointer';
        newRow.style.border = 'solid 1px';
        newRow.style.marginBottom = '5px';
        console.log('white');
          if (emails[i].read){
            newRow.style.color = 'white';
            console.log('white');
          } else {
            newRow.style.color = 'grey';
            console.log('grey');
          }

        newTable.appendChild(newRow);
        const email_id = emails[i].id;
        newRow.id = email_id;
        newRow.addEventListener('click', () => view_email(email_id));

        const sender_col = document.createElement('div');
        sender_col.className = 'col';
        sender_col.innerHTML = emails[i].sender;
        newRow.appendChild(sender_col);
        const subject_col = document.createElement('div');
        subject_col.className = 'col';
        subject_col.innerHTML = emails[i].subject;
        newRow.appendChild(subject_col);
        const time_col = document.createElement('div');
        time_col.className = 'col';
        time_col.innerHTML = emails[i].timestamp;
        newRow.appendChild(time_col);
      };  
    });
}

function load_email_view (){

  if(!email_view_loaded){
  //adding html for email view
  const newTable = document.createElement('div');
  newTable.id = 'display-email-view';
  newTable.className = 'container';
  document.body.append(newTable);
  const sender = document.createElement('div');
  sender.id = 'sender';
  const recepients = document.createElement('div');
  recepients.id = 'recepients';
  const subject = document.createElement('div');
  subject.id = 'subject';
  const timestamp = document.createElement('div');
  timestamp.id = 'timestamp';
  const body = document.createElement('div');
  body.id = 'body';
  const archive_bttn = document.createElement('button');
  archive_bttn.id = 'archive_bttn';
  const reply_bttn = document.createElement('button');
  reply_bttn.id = 'reply_bttn';
  reply_bttn.textContent = 'Reply';
  document.querySelector('#display-email-view').appendChild(sender);
  document.querySelector('#display-email-view').appendChild(recepients);
  document.querySelector('#display-email-view').appendChild(subject);
  document.querySelector('#display-email-view').appendChild(timestamp);
  document.querySelector('#display-email-view').appendChild(body);
  document.querySelector('#display-email-view').appendChild(archive_bttn);
  document.querySelector('#display-email-view').appendChild(reply_bttn);
  }
}

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
}

function view_email(email_id) {
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-email-view').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

    // ... do something else with email ...
    document.querySelector('#sender').innerHTML = 'Sender: ' + email.sender;
    document.querySelector('#recepients').innerHTML = 'Recepients: ' + email.recepients;
    document.querySelector('#subject').innerHTML = 'Subject: ' + email.subject;
    document.querySelector('#timestamp').innerHTML = 'Timestamp: ' + email.timestamp;
    document.querySelector('#body').innerHTML = 'Body: ' + email.body;
    if(email.archived){
      document.querySelector('#archive_bttn').textContent = 'Unarchive this email';
      document.querySelector('#archive_bttn').addEventListener('click',()=> {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      });
      //load_mailbox('inbox');
      document.location.reload();
      })
    }
    else{
      document.querySelector('#archive_bttn').textContent = 'Archive this email';
      document.querySelector('#archive_bttn').addEventListener('click', function() {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      });
      //load_mailbox('inbox')
      document.location.reload();
      })
    }
    document.querySelector('#reply_bttn').addEventListener('click', function() {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#display-email-view').style.display = 'none';

      // remove RE from subject if exists
      var subject_str = null;
      if (email.subject.substr(0,3) != 'Re:'){
        subject_str = 'Re: '+ email.subject;
      } else{
        subject_str = email.subject;
      }
      // Prefill fields
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = subject_str;
      document.querySelector('#compose-body').value = 'On ' + email.timestamp + " " + email.sender + " wrote: " + email.body;  
    });
  })

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}
