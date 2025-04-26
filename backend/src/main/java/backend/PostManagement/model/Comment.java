package backend.PostManagement.model;

public class Comment {

    private String id;
    private String userID;
    private String userFullName;
    private String content;

    // Getters and Setters
    public String getId() {
        return this.id;
    }

    public void setId(String idValue) {
        this.id = idValue;
    }

    public String getUserID() {
        return this.userID;
    }

    public void setUserID(String userIdValue) {
        this.userID = userIdValue;
    }

    public String getUserFullName() {
        return this.userFullName;
    }

    public void setUserFullName(String fullName) {
        this.userFullName = fullName;
    }

    public String getContent() {
        return this.content;
    }

    public void setContent(String textContent) {
        this.content = textContent;
    }

    // toString Method
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Comment{");
        sb.append("id='").append(id).append('\'');
        sb.append(", userID='").append(userID).append('\'');
        sb.append(", userFullName='").append(userFullName).append('\'');
        sb.append(", content='").append(content).append('\'');
        sb.append('}');
        return sb.toString();
    }
}
