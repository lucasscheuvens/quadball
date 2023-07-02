function getNewRandomGameId(){var id=new RandExp(/[1-9a-km-zA-HJ-NP-Z]{6}/).gen();return id;}
function getNewRandomPublicGameId() // format: A-000-000-000
{
    var id="A";
    for(var j=0;j<3;j++){id+="-";for(var i=0;i<3;i++){id+=Math.floor(Math.random()*10).toString();}}
    return id;
}