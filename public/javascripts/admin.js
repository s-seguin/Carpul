$('document').ready(function () {
    $.ajax({
        url:'/api/users',
        success: (res) => buildTable(res),
        error: (res) => console.log(res)
    });

});

function buildTable(users) {
    console.log(JSON.stringify(users));
    let myEmail = users.requester;
    for (u in users.data) {
        console.log(users.data[u]);
        let tr =
            "<tr>" +
            "<td>" + users.data[u].email+ "</td>" +
            "<td>" + users.data[u].fname+ "</td>" +
            "<td>" + users.data[u].lname+ "</td>" +
            "<td>" + users.data[u].phone+ "</td>" +
            "<td>" + users.data[u].last_login+ "</td>" +
            "<td>" + users.data[u].created_on+ "</td>" +
            "<td>";

        if (myEmail !== users.data[u].email)
            tr += "<button class='btn btn-sm btn-danger' onclick='deleteUser(\""+users.data[u].email+"\")'>Delete</button></td></tr>";
        else
            tr += "</td></tr>";
        $('#userTableBody').append(tr);

    }
}

function deleteUser(email) {
    if (confirm("Are you sure you want to delete user: " + email + "?")){
        $.post('/api/user/delete', { email: email},
            function(returnedData){
                console.log(returnedData);
        });
    }
}