import { ethers, InfuraProvider } from "ethers";
import FileManagerFactorContract from "../../contracts/FileModule#FileManagerFactory";
import FileManagerContract from "../../contracts/FileManager";

async function FilesPage() {
  const provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
  const contract = new ethers.Contract(
    process.env.FILES_FACTORY_CONTRACT_ADDRESS,
    FileManagerFactorContract.abi,
    provider
  );

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = contract.connect(signer);
  const filesByOwner = await contractWithSigner.getFilesByOwner(2);

  let files = [];
  if (filesByOwner.length > 0) {
    const fileContract = new ethers.Contract(filesByOwner[0], FileManagerContract.abi, provider);
    const fileData = await fileContract.getFileContent();
    //Exemple of return :
    /*
      [
        'Test File',
        'ABDFSDGFS',
        2n,
        345346543576345687n,
        1717415772n
      ]
    */
    files.push({
      name: fileData[0],
      hash: fileData[1],
      ower: fileData[2],
      lastModified: new Date(Number(fileData[3]) * 1000),
      transactionTimestamp: new Date(Number(fileData[4]) * 1000),
    });
  }

  return (
    <>
      <h2>Files</h2>
      <table className="table-auto">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Hash</th>
            <th>Last Modified</th>
            <th>Tx Date</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={index}>
              <td>{index}</td>
              <td>{file.name}</td>
              <td>{file.hash}</td>
              <td>{file.lastModified.toLocaleDateString()}</td>
              <td>{file.transactionTimestamp.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Total Files: {files.length}</p>
    </>
  );
}

export default FilesPage;
