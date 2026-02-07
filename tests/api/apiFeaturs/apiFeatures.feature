Feature: API E2E Scenarios - Swagger Notes

  Scenario Outline: Register, Change Password, and Manage Notes
    Given The API base URL is "https://practice.expandtesting.com/notes/api"
    
    # 1. Register and Verify
    When I register a new user with name "<name>" and password "<password>"
    Then The user should be created successfully
    
    # 2. Change Password and Verify
    And I log in to get the access token
    And I change my password from "<password>" to "<newPassword>"
    Then The password should be updated successfully
    And I log in with the new password "<newPassword>"

    # 3. Update Note and Verify
    When I create a new note with title "<noteTitle>" and description "<noteDesc>"
    And I update the note title to "<updatedNoteTitle>"
    Then The note should reflect the updated title "<updatedNoteTitle>"

    # 4. Delete Note and Verify
    When I delete the current note
    Then The note should no longer exist in the system

    Examples:
      | name   | password       | newPassword      | noteTitle    | updatedNoteTitle | noteDesc          |
      | Tester | OldPassword123 | NewSecurePass456 | Start Title  | Finish Title     | API E2E Testing   |