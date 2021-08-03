window.onLoad = populatePosts();
window.onLoad = populateFriendsList();

function postPage() {
    window.location = "../createPost.html";
}

//Generates the html for a friend for friends list
function createFriend(friendData) {
    var str = '';
    str += '<div class="friendItem">';
    str += '<h3>' + friendData.Username + '</h3>';
    str += '<p class="friendBio">' + friendData.Bio + '</p>';
    str += '</div>';
    return str;
}

//Gets list of user's friends from db and displays in the FriendsContent
function populateFriendsList() {
    //generate friends list and insert into friendsContent
    var friendListArea = $('#friendsContent');
    //get username and then get user's friend list
    $.ajax({
        url: '/get/username/',
        method: 'GET',
        success: function(res) {
            var result = JSON.parse(res);
            var userName = result.text;
            $.ajax({
                url: '/get/user/friends',
                method: 'GET',
                success: function(res) {
                    //array of the user's friends
                    var result = JSON.parse(res);
                    var friendsHtml = '';
                    for (var i = 0; i < result.length; i++) {
                        friendsHtml += createFriend(result[i]);
                    }
                    //add friendsHtml to section
                    friendListArea.html(friendsHtml);
                }
            });
        }
    });
}

//adds a friend to user's friends TODO  no button exists yet
function addFriend() {
    //button's id is the friend to be added
    //TODO not sure where this button is made yet
    var name = 'Joe'; //TODO pick name off button

    //create a JSON obj
    var friendObj = { friendName: name };
    var friendObj_str = JSON.stringify(friendObj);

    $.ajax({
        url: '/add/user/friend',
        data: { friendObjStr: friendObj_str },
        method: 'POST',
        success: function(res) {
            var result = JSON.parse(res);

            //if error returned report
            if (result.text == 'error') {
                alert('error');
            } else {
                alert('friend added!');
            }
        }
    });
}

function updateBio() {
    //TODO no button exists yet to do this
    var b = $('#newBio').val().toString();

    //create a JSON obj
    var bioObj = { bio: b };
    var bioObj_str = JSON.stringify(bioObj);

    $.ajax({
        url: '/update/bio',
        data: { bioObjStr: bioObj_str },
        method: 'POST',
        success: function(res) {
            var result = JSON.parse(res);

            //if error returned report
            if (result.text == 'error') {
                alert('error');
            } else {
                alert('bio updated!');
            }
        }
    });
}

/* duplicate code from a branch merge? 
function searchUsers() {
    name = document.getElementById("searchName").innerText;
    var searchObj = {
        username: name
    };
    $.ajax({
        url: "/search/user",
        method: "GET",
        data: searchObj,
        success: function(result) {}
    });
}

function searchPosts() {
    post = document.getElementById("searchPost").innerText;
    var searchObj = {
        keyword: key
    };
    $.ajax({
        url: "/search/posts",
        method: "GET",
        data: searchObj,
        success: function(result) {}
    });
}*/

function timeUpdate() {
    //moved this to onLoad, friends can be loaded on page load
    //setInterval(populateFriendsList, 1000);
}

function populatePosts() {
    $.ajax({
        url: "/get/posts",
        method: "GET",
        success: function(result) {
            // updates text with result from request
            results = JSON.parse(result);
            let displayedResult = '';
            // iterates through each post and adds it to the result
            for (i in results) {
              console.log(results[i]);
              console.log(results[i].Comments);
                displayedResult += '<div class="postDiv" id="postDiv' + i + '"><h2 id="getTitle' + i + '">' +
                    results[i].Title + '</h2><div id="getContent' + i + '">' +
                    results[i].Content + '</div><br><br>' +
                '<div id= "actionBar' + i + '">' +
                '<span id="comment' + i + '">' +
                '<input type = "text" name = comment id = "getCommentText' + i + '"/>' +
                '<input type="button"value="Comment"onclick="comment(this);" id = "commentButton' + i + '">' +
                '</span><span id="like' + i + '"><input type="button" value="Like"onclick="like(this);"> '
                +  results[i].Likes.length + ' Likes<br>'
                +'</span></div><br><div>Comments:</div>';

                for (j in results[i].Comments) {
                  displayedResult += '<div id=commentDiv>' + results[i].Comments[j].Content+ '</div>';
                }
                displayedResult += '</div>';
            }
            postsContent.innerHTML = displayedResult;
        }
    });
}

function like(divName){
  var parent1 = divName.parentNode; //span
  var parent2 = parent1.parentNode; //actionBar div
  var parent = parent2.parentNode; // actual post div
  //console.log(parent);
  var divArray = parent.children;
  console.log(divArray);

  // gets title
  ti = divArray[0].id;
  t = document.getElementById(ti).innerText;

  // gets content
  co = divArray[1].id;
  c = document.getElementById(co).innerText;

  $.ajax({
      url: "/like/post/" + t +"/" + c,
      method: "GET",
      success: function(result) {
        if (result != "GOOD") {
          //alert("You cannot like a post more than once!");
          alert(result);
        } else {
          alert("Post liked!");
          populatePosts();
        }
      }
  });
}

function comment(divName) {
  var parent1 = divName.parentNode; //span
  var parent2 = parent1.parentNode; //actionBar div
  var parent = parent2.parentNode; // actual post div
  var divArray = parent.children;
  ti = divArray[0].id;
  t = document.getElementById(ti).innerText;

  co = divArray[1].id;
  c = document.getElementById(co).innerText;

  var commentArray = parent1.children;
  ct = commentArray[0].id;
  newCommentText = document.getElementById(ct).value;
  $.ajax({
    url: "/comment/post/" + t + "/" + c + "/" + newCommentText,
    method: "GET",
    success: function(result) {
      if (result != "GOOD") {
        alert("ERROR!");
      } else {
        alert("Comment posted!");
        populatePosts();
      }
    }
  });
}

//searches for either users or posts and displays
function search() {
    var option = $('#searchOption').val();
    var key = $('#searchKey').val();

    console.log("Searching with option " + option + " and key " + key)
    //handle depending on the search option
    if (option == "users") {
        $.ajax({
            url: '/search/user/'+key,
            method: 'GET',
            success: function(res) {
                var result = JSON.parse(res);

                //display the users returned in middle section
                var displayedResult = '';
                for(i in result){
                    displayedResult += generateUsers(result[i]);
                }
                //add the html to middle of page
                $('#postsContent').html(displayedResult);
            }
        });
    } else if (option == "posts") {
        $.ajax({
            url: '/search/posts/'+key,
            method: 'GET',
            data: { searchObjStr: searchObj_str },
            success: function(res) {
                var result = JSON.parse(res);
                //display the posts returned in middle section
                var displayedResult = '';
                for(i in result){
                    displayedResult += generatePosts(result[i]);
                }
                //add the html to middle of page
                $('#postsContent').html(displayedResult);
            }
        });
    } else {
        alert("error");
    }
}

//generates html code to display users
function generateUsers(userObj){
    var str = '';
    str += '<div class="userTile" id='+ userObj._id +'>';
    str += '<h3 class="userTileName">'+ userObj.Username +'</h3>';
    str += '<p class="userTileEmail"> Contact: '+ userObj.Email +'</p>';
    str += '<p class="userTileBio">'+ userObj.Bio +'</p>';
    str += '</div>'
    return str;
}

//generates html code to display posts
function generatePosts(postObj){

}

// calls timeUpdate(), which updates the posts every 1 second.
timeUpdate();
