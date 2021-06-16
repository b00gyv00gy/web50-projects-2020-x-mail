document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      const newTable = document.createElement('div');
      newTable.className = 'container';
      document.querySelector('#emails-view').appendChild(newTable);
      for (i=0; i<emails.length; i++ ){
        const newRow = document.createElement('div');
        newRow.className = 'row';
        newRow.style.border = 'solid 1px'
        newRow.style.marginBottom = '5px';
        if (emails[i].read){
          newRow.style.backgroundColor = 'gray'
        }
        newTable.appendChild(newRow);
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