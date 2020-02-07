$(document).ready(() => {

// CHAT CHAT CHAT
  const socket = io();
// sending message
  $("#chatForm").submit(() => {
    let text = $("#chat-input").val(),
      userName = $("#chat-user-name").val(),
      userId = $("#chat-user-id").val();
    socket.emit("viesti", {
      content: text,
      userName: userName,
      userId: userId
    });
    $("#chat-input").val("");
    return false;
  });

  socket.on("viesti", (message) => {
    displayMessage(message);
    for (let i=0; i < 2; i++) {
      $(".chat-icon").fadeOut(200).fadeIn(200);
    }
  });

// load last messages
  socket.on("load all messages", data => {
    data.forEach(message => {
      displayMessage(message);
    });
  });

// notifications
  socket.on("user disconnected", () => {
    displayMessage({
      userName: "Notice",
      content: "User left the chat"
    });
  });

  socket.on("user connected", () => {
    displayMessage({
      userName: "Notice",
      content: "User entered the chat"
    });
  });


  let displayMessage = (message) => {
    $("#chat").prepend(
      $("<li>").html(`
        <strong class="message ${getCurrentUserClass(message.user)}">
        ${message.userName}
        </strong>: ${message.content}
        `));
  };

  let getCurrentUserClass = (id) => {
    let userId = $("#chat-user-id").val();
    return userId === id ? "current-user": "";
  };

// MODAL MODAL MODAL
  let apiToken = $("#apiToken").data("token");
  $("#modal-button").click(() => {
    $(".modal-body").html("");
    $.get(`/api/courses?apiToken=${apiToken}`, (results = {}) => {
      let data = results.data;
      if (!data){
        $(".modal-body").append(`<h4>
          <a href="/users/login">Log in</a> first!
        </h4>`);
        return;
      };

      data.courses.forEach(course => {
        $(".modal-body").append(
          `<div>
						<span class="course-title">
							${course.title}
						</span>
            <button class='${course.joined ? "joined-button" : "join-button"}' data-id="${course._id}">
              ${course.joined ? "Joined" : "Join"}
            </button>
						<div class="course-description">
							${course.description}
						</div>
					</div>`
        );
      });
    }).then(() => {
      addJoinButtonListener();
    });
  });
});

let addJoinButtonListener = () => {
  $(".join-button").click((event) => {
    let $button = $(event.target),
      courseId = $button.data("id"),
      apiToken = $("#apiToken").data("token");
      $.get(`/api/courses/${courseId}/join?apiToken=${apiToken}`, (results = {}) => {
        let data = results.data;
        if (data && data.success) {
          $button
            .text("Joined")
            .addClass("joined-button")
            .removeClass("join-button");
        } else {
          $button.text("Try again");
        }
      });
  });
}
