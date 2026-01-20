function confirmWalletAction() {
    const result = confirm("Would you like to save your password to the wallet?");

    if (result) {
        alert("You clicked YES");
    } else {
        alert("You clicked NO");
    }
}
